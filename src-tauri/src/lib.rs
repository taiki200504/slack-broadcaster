use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Workspace {
    id: String,
    name: String,
    token: String,
    channel_id: String,
    channel_name: String,
    enabled: bool,
}

#[derive(Serialize, Deserialize, Clone)]
struct Template {
    id: String,
    label: String,
    content: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct AppData {
    workspaces: Vec<Workspace>,
    templates: Vec<Template>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct SendResult {
    workspace_id: String,
    workspace_name: String,
    success: bool,
    error: Option<String>,
}

#[derive(Deserialize)]
struct SlackResponse {
    ok: bool,
    error: Option<String>,
    user: Option<String>,
    team: Option<String>,
}

#[derive(Serialize)]
struct TestTokenResult {
    ok: bool,
    user: Option<String>,
    team: Option<String>,
    error: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct BroadcastTarget {
    token: String,
    channel_id: String,
    workspace_id: String,
    workspace_name: String,
}

struct AppState {
    http: reqwest::Client,
}

fn default_data() -> AppData {
    AppData {
        workspaces: vec![],
        templates: vec![
            Template {
                id: "1".into(),
                label: "おはよう".into(),
                content: "おはようございます！今日もよろしくお願いします🙌".into(),
            },
            Template {
                id: "2".into(),
                label: "お疲れ様".into(),
                content: "お疲れ様でした！また明日👋".into(),
            },
            Template {
                id: "3".into(),
                label: "作業開始".into(),
                content: "作業開始します💻".into(),
            },
        ],
    }
}

#[tauri::command]
fn load_data(app: tauri::AppHandle) -> AppData {
    let dir = app.path().app_data_dir().expect("no app data dir");
    let _ = fs::create_dir_all(&dir);
    let path = dir.join("data.json");

    if path.exists() {
        fs::read_to_string(&path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_else(default_data)
    } else {
        let data = default_data();
        if let Ok(json) = serde_json::to_string_pretty(&data) {
            let _ = fs::write(&path, json);
        }
        data
    }
}

#[tauri::command]
fn save_data(app: tauri::AppHandle, data: AppData) {
    let dir = app.path().app_data_dir().expect("no app data dir");
    let _ = fs::create_dir_all(&dir);
    let path = dir.join("data.json");
    if let Ok(json) = serde_json::to_string_pretty(&data) {
        let _ = fs::write(path, json);
    }
}

fn error_hint(error: &str) -> Option<&str> {
    match error {
        "missing_scope" => Some("chat:write スコープを追加してください"),
        "not_in_channel" => Some("チャンネルに参加してください"),
        "channel_not_found" => Some("チャンネルIDを確認してください"),
        "invalid_auth" => Some("トークンが無効です"),
        "token_revoked" => Some("トークンが無効化されています"),
        "not_authed" => Some("トークンが設定されていません"),
        "account_inactive" => Some("アカウントが無効です"),
        _ => None,
    }
}

async fn post_message(
    client: &reqwest::Client,
    token: &str,
    channel_id: &str,
    text: &str,
    workspace_id: String,
    workspace_name: String,
) -> SendResult {
    let res = client
        .post("https://slack.com/api/chat.postMessage")
        .header("Authorization", format!("Bearer {}", token))
        .json(&serde_json::json!({ "channel": channel_id, "text": text }))
        .send()
        .await;

    match res {
        Ok(resp) => match resp.json::<SlackResponse>().await {
            Ok(data) if data.ok => SendResult {
                workspace_id,
                workspace_name,
                success: true,
                error: None,
            },
            Ok(data) => {
                let err = data.error.unwrap_or_else(|| "Unknown error".into());
                let msg = match error_hint(&err) {
                    Some(hint) => format!("{} ({})", err, hint),
                    None => err,
                };
                SendResult {
                    workspace_id,
                    workspace_name,
                    success: false,
                    error: Some(msg),
                }
            }
            Err(e) => SendResult {
                workspace_id,
                workspace_name,
                success: false,
                error: Some(e.to_string()),
            },
        },
        Err(e) => SendResult {
            workspace_id,
            workspace_name,
            success: false,
            error: Some(e.to_string()),
        },
    }
}

#[tauri::command]
async fn broadcast_message(
    state: tauri::State<'_, AppState>,
    targets: Vec<BroadcastTarget>,
    text: String,
) -> Result<Vec<SendResult>, ()> {
    let client = state.http.clone();
    let handles: Vec<_> = targets
        .into_iter()
        .map(|t| {
            let client = client.clone();
            let text = text.clone();
            tokio::spawn(async move {
                post_message(
                    &client,
                    &t.token,
                    &t.channel_id,
                    &text,
                    t.workspace_id,
                    t.workspace_name,
                )
                .await
            })
        })
        .collect();

    let mut results = Vec::with_capacity(handles.len());
    for handle in handles {
        match handle.await {
            Ok(r) => results.push(r),
            Err(e) => {
                let err_msg: String = e.to_string();
                results.push(SendResult {
                    workspace_id: String::new(),
                    workspace_name: String::new(),
                    success: false,
                    error: Some(err_msg),
                });
            }
        }
    }
    Ok(results)
}

#[tauri::command]
async fn test_token(
    state: tauri::State<'_, AppState>,
    token: String,
) -> Result<TestTokenResult, ()> {
    let res = state
        .http
        .post("https://slack.com/api/auth.test")
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await;

    Ok(match res {
        Ok(resp) => match resp.json::<SlackResponse>().await {
            Ok(data) if data.ok => TestTokenResult {
                ok: true,
                user: data.user,
                team: data.team,
                error: None,
            },
            Ok(data) => TestTokenResult {
                ok: false,
                user: None,
                team: None,
                error: data.error,
            },
            Err(e) => TestTokenResult {
                ok: false,
                user: None,
                team: None,
                error: Some(e.to_string()),
            },
        },
        Err(e) => TestTokenResult {
            ok: false,
            user: None,
            team: None,
            error: Some(e.to_string()),
        },
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            http: reqwest::Client::new(),
        })
        .invoke_handler(tauri::generate_handler![
            load_data,
            save_data,
            broadcast_message,
            test_token,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

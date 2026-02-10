use std::env;
use warp::Filter;
use tonic::transport::Channel;
use crate::proto::matching::matching_client::MatchingClient;

pub async fn start_health_server(port: u16) {
    let health = warp::path("health").map(|| {
        let vars: std::collections::HashMap<String, String> = env::vars().collect();
        warp::reply::json(&serde_json::json!({
            "status": "ok",
            "environment": env::var("APP_ENV").unwrap_or_else(|_| "unknown".to_string()),
            "envVars": vars
        }))
    });

    println!("HTTP Health Server listening on :{}", port);
    warp::serve(health).run(([0, 0, 0, 0], port)).await;
}

pub async fn connect_to_matching_engine(url: &str) -> Option<MatchingClient<Channel>> {
    let mut retry_count = 0;
    let max_retries = 60;
    
    loop {
        match MatchingClient::connect(url.to_string()).await {
            Ok(client) => {
                println!("Connected to Matching Engine.");
                return Some(client);
            },
            Err(e) => {
                retry_count += 1;
                eprintln!("Failed to connect to Matching Engine: {}. Retry {}/{}...", e, retry_count, max_retries);
                if retry_count >= max_retries {
                    eprintln!("Giving up on Matching Engine connection. Orders will strictly be recorded but not matched.");
                    return None;
                }
                tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
            }
        }
    }
}

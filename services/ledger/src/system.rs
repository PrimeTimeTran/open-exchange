use std::env;
use warp::Filter;
use tonic::transport::{Channel, Endpoint};
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
    println!("Configuring lazy connection to Matching Engine at {}", url);
    match Endpoint::from_shared(url.to_string()) {
        Ok(endpoint) => {
             // connect_lazy returns a Channel immediately.
             // The actual connection happens in the background when requests are made.
            let channel = endpoint.connect_lazy();
            Some(MatchingClient::new(channel))
        },
        Err(e) => {
            eprintln!("Invalid Matching Engine URL '{}': {}", url, e);
            None
        }
    }
}

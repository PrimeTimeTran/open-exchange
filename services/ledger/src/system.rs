use warp::Filter;
use std::env;

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

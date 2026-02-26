use crate::helpers::memory::InMemoryTestContext;
use ledger::proto::ledger::user_service_server::UserService;
use ledger::proto::ledger::{
    CreateUserRequest,
    DeleteUserRequest,
    GetUserRequest,
    UpdateUserRequest,
};
use tonic::Request;
use uuid::Uuid;

#[tokio::test]
async fn test_create_user_success() -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();
    let email = "test@example.com".to_string();

    let req = Request::new(CreateUserRequest {
        email: email.clone(),
        password: "password123".to_string(),
        first_name: "John".to_string(),
        last_name: "Doe".to_string(),
    });

    let resp = ctx.user_api.create_user(req).await.expect("Failed to create user").into_inner();
    let user = resp.user.expect("User should be returned");

    assert_eq!(user.email, email);
    assert!(!user.id.is_empty());
    Ok(())
}

#[tokio::test]
async fn test_get_user_success() -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();

    // Create user first
    let create_req = Request::new(CreateUserRequest {
        email: "get@example.com".to_string(),
        password: "pw".to_string(),
        first_name: "Jane".to_string(),
        last_name: "Doe".to_string(),
    });
    let created_user = ctx.user_api
        .create_user(create_req).await
        .expect("Failed to create user")
        .into_inner()
        .user.expect("User missing");

    // Get user
    let get_req = Request::new(GetUserRequest {
        user_id: created_user.id.clone(),
    });
    let resp = ctx.user_api.get_user(get_req).await.expect("Failed to get user").into_inner();
    let fetched_user = resp.user.expect("User missing");

    assert_eq!(fetched_user.id, created_user.id);
    assert_eq!(fetched_user.email, created_user.email);
    Ok(())
}

#[tokio::test]
async fn test_get_user_not_found() -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();
    let get_req = Request::new(GetUserRequest {
        user_id: Uuid::new_v4().to_string(),
    });

    let resp = ctx.user_api.get_user(get_req).await;
    assert!(resp.is_err(), "Should return error for non-existent user");
    assert_eq!(resp.expect_err("Expect error").code(), tonic::Code::NotFound);
    Ok(())
}

#[tokio::test]
async fn test_update_user_details() -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();

    // Create
    let create_req = Request::new(CreateUserRequest {
        email: "update@example.com".to_string(),
        password: "pw".to_string(),
        first_name: "Original".to_string(),
        last_name: "Name".to_string(),
    });
    let mut user = ctx.user_api
        .create_user(create_req).await
        .expect("Failed to create user")
        .into_inner()
        .user.expect("User missing");

    // Update
    user.email = "new@example.com".to_string(); // Updating email
    // Note: In real system, changing email might require verification logic,
    // but here we test the persistence of the update.

    let update_req = Request::new(UpdateUserRequest {
        user: Some(user.clone()),
    });
    let update_resp = ctx.user_api
        .update_user(update_req).await
        .expect("Failed to update user")
        .into_inner();
    let updated_user = update_resp.user.expect("User missing");

    assert_eq!(updated_user.email, "new@example.com");

    // Verify persistence
    let get_req = Request::new(GetUserRequest {
        user_id: user.id.clone(),
    });
    let final_user = ctx.user_api
        .get_user(get_req).await
        .expect("Failed to get user")
        .into_inner()
        .user.expect("User missing");
    assert_eq!(final_user.email, "new@example.com");
    Ok(())
}

#[tokio::test]
async fn test_delete_user_check() -> Result<(), Box<dyn std::error::Error>> {
    let ctx = InMemoryTestContext::new();

    let create_req = Request::new(CreateUserRequest {
        email: "del@example.com".to_string(),
        password: "pw".to_string(),
        first_name: "Del".to_string(),
        last_name: "Me".to_string(),
    });
    let user = ctx.user_api
        .create_user(create_req).await
        .expect("Failed to create user")
        .into_inner()
        .user.expect("User missing");

    // Delete
    let del_req = Request::new(DeleteUserRequest {
        user_id: user.id.clone(),
    });
    let del_resp = ctx.user_api
        .delete_user(del_req).await
        .expect("Failed to delete user")
        .into_inner();
    assert!(del_resp.success);

    // Verify Gone
    let get_req = Request::new(GetUserRequest {
        user_id: user.id.clone(),
    });
    let get_resp = ctx.user_api.get_user(get_req).await;
    assert!(get_resp.is_err(), "Deleted user should not be found");
    Ok(())
}

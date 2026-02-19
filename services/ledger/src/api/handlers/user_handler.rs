use crate::proto::ledger::*;
use crate::domain::users::UserService;
use tonic::{Request, Response, Status};

pub async fn create_user(
    user_service: &UserService,
    request: Request<CreateUserRequest>,
) -> Result<Response<CreateUserResponse>, Status> {
    let req = request.into_inner();
    
    let user = user_service.create_new_user(
        req.email,
        req.password,
        req.first_name,
        req.last_name,
    );

    Ok(Response::new(CreateUserResponse {
        user: Some(user),
    }))
}

pub async fn get_user(
    user_service: &UserService,
    request: Request<GetUserRequest>,
) -> Result<Response<GetUserResponse>, Status> {
    let req = request.into_inner();
    if let Some(user) = user_service.get_user(&req.user_id) {
            Ok(Response::new(GetUserResponse {
                user: Some(user),
            }))
    } else {
            Err(Status::not_found("User not found"))
    }
}

pub async fn update_user(
    user_service: &UserService,
    request: Request<UpdateUserRequest>,
) -> Result<Response<UpdateUserResponse>, Status> {
    let req = request.into_inner();
    if let Some(user) = req.user {
            if user_service.update_user(user.clone()) {
                Ok(Response::new(UpdateUserResponse {
                    user: Some(user),
                }))
            } else {
                Err(Status::not_found("User not found"))
            }
    } else {
            Err(Status::invalid_argument("User is required"))
    }
}

pub async fn delete_user(
    user_service: &UserService,
    request: Request<DeleteUserRequest>,
) -> Result<Response<DeleteUserResponse>, Status> {
    let req = request.into_inner();
    if user_service.delete_user(&req.user_id) {
            Ok(Response::new(DeleteUserResponse {
                success: true,
                message: "User deleted".to_string(),
            }))
    } else {
            Err(Status::not_found("User not found"))
    }
}

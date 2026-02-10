// Centralized module for generated Protobuf code
pub mod hello_world {
    tonic::include_proto!("helloworld");
}

#[allow(dead_code)]
pub mod common {
    tonic::include_proto!("common");
}

pub mod ledger {
    tonic::include_proto!("ledger");
}

pub mod matching {
    tonic::include_proto!("matching");
}

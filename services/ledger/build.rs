use std::env;
use std::path::PathBuf;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());

    // Compile the protos
    // We need to point to the root proto directory
    let proto_root = "../../proto";

    // List of protos to compile
    let protos = &[
        "../../proto/common/order.proto",
        "../../proto/common/ledger_entry.proto",
        "../../proto/common/ledger_event.proto",
        "../../proto/common/trade.proto",
        "../../proto/ledger/ledger.proto",
        "../../proto/matching/engine.proto",
        // Add more protos here
    ];

    tonic_build::configure()
        .build_server(true)
        .build_client(true) // We might need to call other services
        .file_descriptor_set_path(out_dir.join("ledger_descriptor.bin"))
        .compile_protos(protos, &[proto_root])?;

    Ok(())
}

{ pkgs ? import <nixpkgs> { } }:

let
    rust_overlay = import (builtins.fetchTarball "https://github.com/oxalica/rust-overlay/archive/master.tar.gz");
    pkgs = import <nixpkgs> { overlays = [ rust_overlay ]; };
    rust = pkgs.rust-bin.stable."1.91.1".default.override {
        extensions = [ "rust-src" "rust-analyzer" ];
        targets = [ "wasm32-unknown-unknown" ];
    };
in
pkgs.mkShell {
    buildInputs = [
      rust
    ] ++ (with pkgs; [
      nodejs_20
      nodePackages.pnpm
    ]);
    nativeBuildInputs = with pkgs; [];
    packages = with pkgs; [
      wasm-pack
    ];

    RUST_BACKTRACE = 1;
}

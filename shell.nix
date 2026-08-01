{ pkgs ? import <nixpkgs> { } }:

let
    rust_overlay = import (builtins.fetchTarball "https://github.com/oxalica/rust-overlay/archive/master.tar.gz");
    pkgs = import <nixpkgs> { overlays = [ rust_overlay ]; };
    rust = pkgs.rust-bin.nightly."2026-01-22".default.override {
        extensions = [ "rust-src" "rust-analyzer" ];
        targets = [ "wasm32-unknown-unknown" ];
    };
in
pkgs.mkShell ({
    buildInputs = [
      rust
    ] ++ (with pkgs; [
      nodejs_26
      pnpm
      chromium
    ]);
    nativeBuildInputs = with pkgs; [];
    packages = with pkgs; [
      wasm-pack
      binaryen
    ];

    RUST_BACKTRACE = 1;
    NODE_OPTIONS = "--no-deprecation";
} // pkgs.lib.optionalAttrs pkgs.stdenv.isLinux {
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
    PLAYWRIGHT_BROWSERS_PATH = "0";
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
})

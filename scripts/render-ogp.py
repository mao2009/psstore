#!/usr/bin/env python3
"""Render the PS ARCHIVE social-sharing card as a 1200×630 PNG.

Run from repository root:
  python scripts/render-ogp.py assets/ogp.svg ogp.png
Requires CairoSVG and an installed Noto Sans CJK JP font.
"""
from __future__ import annotations

import argparse
import struct
from pathlib import Path

import cairosvg


WIDTH, HEIGHT = 1200, 630


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    source = args.source.resolve(strict=True)
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    svg = source.read_bytes()

    # OG crawlers may not understand SVG; publish an actual PNG.
    cairosvg.svg2png(
        bytestring=svg,
        write_to=str(output),
        output_width=WIDTH,
        output_height=HEIGHT,
    )

    data = output.read_bytes()
    assert data.startswith(b"\x89PNG\r\n\x1a\n"), "OGP output is not PNG"
    dimensions = struct.unpack(">II", data[16:24])
    assert dimensions == (WIDTH, HEIGHT), f"Invalid image size: {dimensions}"
    assert len(data) <= 5 * 1024 * 1024, "OGP image exceeds 5 MB"
    print(f"OGP card: {output} — {dimensions[0]}×{dimensions[1]}, {len(data):,} bytes")


if __name__ == "__main__":
    main()

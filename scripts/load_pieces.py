#!/usr/bin/env python3

from pathlib import Path

ts_start = '''
'use strict'
'''.lstrip()

ts_function = '''
export const knightSVG = (color: string, outline: string, highlight: string, lowlight: string, lowlight2: string) =>
    `%s`
'''.lstrip()


def replace_colors(svg: str) -> str:
    result = (
        svg.replace(' width="50mm"', '')
        .replace(' height="50mm"', '')
        .replace('fill="#e9e9e9"', 'fill="${color}"')
        .replace('stroke="#2a2a2a"', 'stroke="${outline}"')
        .replace('fill="#fff"', 'fill="${highlight}" style="mix-blend-mode:lighten"')
        .replace('opacity=".2" stroke="#000"', 'fill="${lowlight}" stroke="${lowlight}" style="mix-blend-mode:darken"')
        .replace('opacity=".2"', 'fill="${lowlight}" style="mix-blend-mode:darken"')
        .replace('opacity=".5"', 'fill="${lowlight2}" style="mix-blend-mode:darken"')
    )
    return result


def load_pieces():
    parent_dir = Path(__file__).parents[1].resolve()

    knight_svg_file = parent_dir / 'pieces' / 'wN.svg'
    knight_svg = knight_svg_file.read_text(encoding='utf-8')

    assert '`' not in knight_svg
    knight_fn = ts_function % replace_colors(knight_svg)

    outfile = parent_dir / 'typescript' / 'pieces.ts'
    outfile.write_text(f'{ts_start}\n{knight_fn}', encoding='utf-8', newline='\n')


if __name__ == '__main__':
    load_pieces()

// Terminal integration helpers — cursor management for in-place animation.
// These let the buddy render in a fixed region of the terminal without
// scrolling or clobbering other output.

const ESC = '\x1b[';

export const cursor = {
  hide:     () => process.stdout.write(`${ESC}?25l`),
  show:     () => process.stdout.write(`${ESC}?25h`),
  up:       (n) => process.stdout.write(`${ESC}${n}A`),
  down:     (n) => process.stdout.write(`${ESC}${n}B`),
  right:    (n) => process.stdout.write(`${ESC}${n}C`),
  left:     (n) => process.stdout.write(`${ESC}${n}D`),
  save:     () => process.stdout.write(`${ESC}s`),
  restore:  () => process.stdout.write(`${ESC}u`),
  moveTo:   (row, col) => process.stdout.write(`${ESC}${row};${col}H`),
  clearLine:() => process.stdout.write(`${ESC}2K`),
};

// Write lines at a fixed position, clearing previous frame's excess lines
export function writeAtPosition(lines, prevLineCount, startRow, startCol) {
  cursor.save();
  const maxLines = Math.max(lines.length, prevLineCount);
  for (let i = 0; i < maxLines; i++) {
    cursor.moveTo(startRow + i, startCol);
    cursor.clearLine();
    if (i < lines.length) {
      process.stdout.write(lines[i]);
    }
  }
  cursor.restore();
}

// Write lines inline (appended to current cursor), then move cursor up
// to overwrite on next frame. Good for bottom-of-terminal buddy.
export function writeInline(lines, prevLineCount) {
  // Move up to overwrite previous frame
  if (prevLineCount > 0) {
    cursor.up(prevLineCount);
  }
  for (const line of lines) {
    cursor.clearLine();
    process.stdout.write(line + '\n');
  }
  // Clear any leftover lines from a taller previous frame
  for (let i = lines.length; i < prevLineCount; i++) {
    cursor.clearLine();
    process.stdout.write('\n');
  }
  // Move back up so next overwrite starts from the right place
  if (lines.length < prevLineCount) {
    cursor.up(prevLineCount - lines.length);
  }
}

// Render buddy in the right margin of the terminal (side panel mode).
// Leaves main terminal content untouched on the left.
export function writeRightAligned(lines, prevLineCount, terminalRows, terminalCols, spriteWidth = 16) {
  cursor.save();
  const startCol = terminalCols - spriteWidth;
  const startRow = Math.max(1, terminalRows - Math.max(lines.length, prevLineCount) - 1);
  const maxLines = Math.max(lines.length, prevLineCount);
  for (let i = 0; i < maxLines; i++) {
    cursor.moveTo(startRow + i, startCol);
    // Clear only the right portion
    process.stdout.write(' '.repeat(spriteWidth));
    cursor.moveTo(startRow + i, startCol);
    if (i < lines.length) {
      process.stdout.write(lines[i]);
    }
  }
  cursor.restore();
}

package chess;

public class BoardCell {
	private char row;
	private char col;

	public BoardCell(char r, char c) {
		row = r;
		col = c;
	}

	public char getRow() { return row; }

	public char getCol() { return col; }

	public String toString() { return "row = "+row+" col = "+col; }
}

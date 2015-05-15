package chess;

public class BoardCell {
	private int row;
	private int col;

	public BoardCell(int r, int c) {
		row = r;
		col = c;
	}

	public int getRow() { return row; }

	public int getCol() { return col; }

	public String toString() { return "row = "+row+"\tcol = "+col; }
}

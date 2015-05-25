package chess;

public class Move {
	private BoardCell fromCell;
	private BoardCell toCell;
	private Piece movedPiece;
	
	public Move(BoardCell f, BoardCell t, Piece p){
		this.fromCell = f;
		this.toCell = t;
		this.movedPiece = p;
	}
	
	public BoardCell getFromCell() { return fromCell; }
	public BoardCell getToCell() { return toCell; }
	public Piece getMovedPiece() { return movedPiece; }
	
	public String toString(){ return "From="+this.fromCell.toString()+"\tTo="+this.toCell.toString()
			+"\tPiece="+this.movedPiece.getClass(); }
}

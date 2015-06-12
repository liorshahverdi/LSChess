package chess;

public class Move {
	private BoardCell fromCell;
	private BoardCell toCell;
	private Piece movedPiece;
	private boolean isKill;
	
	public Move(BoardCell f, BoardCell t, Piece p){
		this.fromCell = f;
		this.toCell = t;
		this.movedPiece = p;
		this.isKill = false;
	}
	
	public Move(BoardCell f, BoardCell t, Piece p, boolean bt){
		this.fromCell = f;
		this.toCell = t;
		this.movedPiece = p;
		this.isKill = true;
	}
	
	public BoardCell getFromCell() { return fromCell; }
	public BoardCell getToCell() { return toCell; }
	public Piece getMovedPiece() { return movedPiece; }
	public boolean getIsKill() { return isKill; }
	
	public String toString(){ return "From="+this.fromCell.toString()+"\tTo="+this.toCell.toString()
			+"\tPiece="+this.movedPiece.getClass(); }
}

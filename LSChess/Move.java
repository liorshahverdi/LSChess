
public class Move {
	private BoardCell fromCell;
	private BoardCell toCell;
	private Piece movedPiece;
	private Piece targetedPiece;
	
	public Move(BoardCell f, BoardCell t, Piece p){
		this.fromCell = f;
		this.toCell = t;
		this.movedPiece = p;
		this.targetedPiece = null;
	}
	
	public Move(BoardCell f, BoardCell t, Piece mp, Piece tp){
		this.fromCell = f;
		this.toCell = t;
		this.movedPiece = mp;
		this.targetedPiece = tp;
	}
	
	public BoardCell getFromCell() { return fromCell; }
	public BoardCell getToCell() { return toCell; }
	public Piece getMovedPiece() { return movedPiece; }
	public Piece getTargetedPiece() { return targetedPiece; }
	
	public String toString(){ 
		if (this.targetedPiece == null) return "from="+this.fromCell.toString()+" to="+this.toCell.toString()+" "+this.movedPiece.getClass();
		else return "from="+this.fromCell.toString()+" to="+this.toCell.toString()+" "+this.movedPiece.getClass()+" "+this.targetedPiece.getClass();
	}
}

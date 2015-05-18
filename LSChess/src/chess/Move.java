package chess;

public class Move {
	private BoardCell fromCell;
	private BoardCell toCell;
	
	public Move(BoardCell f, BoardCell t){
		this.fromCell = f;
		this.toCell = t;
	}
	
	public String toString(){ return "From="+this.fromCell.toString()+"\tTo="+this.toCell.toString(); }
}

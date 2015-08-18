import javax.swing.*;

public class WhitePawn extends JLabel implements Piece{
	private static ImageIcon img = new ImageIcon("Images\\white-pawn.png");
	private BoardCell currentCellOccupied;
	
	public void setCurrentCellOccupied(BoardCell x){ this.currentCellOccupied = x; }
	public BoardCell getCurrentCellOccupied() { return currentCellOccupied; }
	
	public WhitePawn(){
		super(img);
	}
	@Override
	public Board.ChessPiece getEnumVal() {
		// TODO Auto-generated method stub
		return Board.ChessPiece.WHITE_PAWN;
	}
}
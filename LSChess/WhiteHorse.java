import javax.swing.*;

public class WhiteHorse extends JLabel implements Piece{
	private static ImageIcon img = new ImageIcon("Images\\white-horse.png");
	private static BoardCell currentCellOccupied;
	
	public WhiteHorse(){
		super(img);
	}

	@Override
	public void setCurrentCellOccupied(BoardCell x) {
		// TODO Auto-generated method stub
		this.currentCellOccupied = x;
	}

	@Override
	public BoardCell getCurrentCellOccupied() {
		// TODO Auto-generated method stub
		return currentCellOccupied;
	}

	@Override
	public Board.ChessPiece getEnumVal() {
		// TODO Auto-generated method stub
		return Board.ChessPiece.WHITE_KNIGHT;
	}
}
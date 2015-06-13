package chess;

import javax.swing.*;

import chess.Board.ChessPiece;
public class BlackQueen extends JLabel implements Piece{
	private static ImageIcon img = new ImageIcon("Images\\black-queen.png");
	private BoardCell currentCellOccupied;
	
	public BlackQueen(){
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
	public ChessPiece getEnumVal() {
		// TODO Auto-generated method stub
		return ChessPiece.BLACK_QUEEN;
	}
}

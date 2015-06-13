package chess;

import javax.swing.*;

import chess.Board.ChessPiece;

public class WhitePawn extends JLabel implements Piece{
	private static ImageIcon img = new ImageIcon("Images\\white-pawn.png");
	private BoardCell currentCellOccupied;
	
	public void setCurrentCellOccupied(BoardCell x){ this.currentCellOccupied = x; }
	public BoardCell getCurrentCellOccupied() { return currentCellOccupied; }
	
	public WhitePawn(){
		super(img);
	}
	@Override
	public ChessPiece getEnumVal() {
		// TODO Auto-generated method stub
		return ChessPiece.WHITE_PAWN;
	}
}

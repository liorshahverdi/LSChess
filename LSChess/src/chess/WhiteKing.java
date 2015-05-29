package chess;

import javax.swing.*;

import chess.Board.ChessPiece;

import java.awt.*;

public class WhiteKing extends JLabel implements Piece{
	private static ImageIcon img = new ImageIcon("Images\\white-king.png");
	private static BoardCell currentCellOccupied;
	
	public WhiteKing(){
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
		return ChessPiece.WHITE_KING;
	}
}


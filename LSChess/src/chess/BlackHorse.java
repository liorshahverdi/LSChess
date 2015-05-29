package chess;

import javax.swing.*;

import chess.Board.ChessPiece;

import java.awt.*;
import java.util.ArrayList;

public class BlackHorse extends JLabel implements Piece{
	private static ImageIcon img = new ImageIcon("Images\\black-horse.png");
	private BoardCell currentCellOccupied;
	
	public BlackHorse(){
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
		return ChessPiece.BLACK_KNIGHT;
	}
}
package chess;

import javax.swing.*;

import java.awt.*;
import java.util.ArrayList;

public class WhitePawn extends JLabel implements Piece{
	private static ImageIcon img = new ImageIcon("Images\\white-pawn.png");
	private BoardCell currentCellOccupied;
	
	public void setCurrentCellOccupied(BoardCell x){ this.currentCellOccupied = x; }
	
	public WhitePawn(){
		super(img);
	}

	@Override
	public ArrayList<Move> possibleMoves() {
		// TODO Auto-generated method stub
		return null;
	}
	
	
}

package chess;

import javax.swing.*;

import java.awt.*;
import java.util.ArrayList;

public class BlackKing extends JLabel implements Piece{
	private static ImageIcon img = new ImageIcon("Images\\black-king.png");
	
	public BlackKing(){
		super(img);
	}

	@Override
	public ArrayList<Move> possibleMoves() {
		// TODO Auto-generated method stub
		return null;
	}
}
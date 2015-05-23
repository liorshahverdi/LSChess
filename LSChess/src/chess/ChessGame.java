package chess;

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;

public class ChessGame {
	
	private static Board model;//model
	private static GUI view;//view
	
	public static int ct;

	public ChessGame(){
		ct = 1;
		model = new Board();
		view = new GUI();
	}
	
	public static String getThisTurnsPlayer(){
		if (ct%2 != 0) return "White";
		else return "Black";
	}
	
	public static boolean gameOver(){return true;}
	
	public static void startGameLoop(){
		boolean keepPlaying = true;
		while (keepPlaying){
			System.out.println("Current Player's Turn -> "+getThisTurnsPlayer());
			if (gameOver()){
				keepPlaying = false;
			}
			else{
				//waitForValInput();
				ct++;
				//flipMat()
			}
		}
	}
	
	public static void main(String[] args){
		java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                ChessGame cg = new ChessGame();
            	view.createAndShowUI();
                view.loadDataToBoardUI(model);
                startGameLoop();
            }
        });
	}
}
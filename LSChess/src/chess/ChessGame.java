package chess;
import javax.swing.*;
import java.util.*;
import java.applet.*;
public class ChessGame{
	
	private static Board model;//model
	private static GUI view;//view
	
	public static int ct;
	public static boolean check;
	
	public static Board getBoard() { return model; }
	
	public ChessGame(){
		ct = 1;
		check = false;
		model = new Board();
		view = new GUI();
	}
	
	public static int getThisTurnsPlayer(){
		if (ct%2 != 0) return 1;
		else return 2;
	}
	
	public static String getOppositeTurnsPlayer(){
		if (getThisTurnsPlayer() == 1) return "Black";
		else return "White";
	}
	
	public static boolean isWhitePiece(Piece t){
		if (t instanceof WhitePawn ||
			t instanceof WhiteHorse ||
			t instanceof WhiteBishop ||
			t instanceof WhiteCastle ||
			t instanceof WhiteQueen ||
			t instanceof WhiteKing) return true;
		else return false;
	}
	
	public static boolean isBlackPiece(Piece t){
		if (t instanceof BlackPawn ||
			t instanceof BlackHorse ||
			t instanceof BlackBishop ||
			t instanceof BlackCastle ||
			t instanceof BlackQueen ||
			t instanceof BlackKing) return true;
		else return false;
	}
	
	public static boolean isCurrentPlayersPiece(Piece t){
		if (getThisTurnsPlayer() == 1){
			if (isWhitePiece(t)) return true;
		}
		if (getThisTurnsPlayer() == 2){
			if (isBlackPiece(t)) return true;
		}
		return false;
	}
	
	//returns the possible moves for the selected piece as an array list of board cells
	public static ArrayList<BoardCell> getMoves(Piece t){
		ArrayList<BoardCell> moves = new ArrayList<BoardCell>();
		if (t instanceof Piece){ //JOptionPane.showMessageDialog(view, t.getClass()+" "+t.getCurrentCellOccupied().toString());
			moves.addAll(Board.ChessPiece.smartPossibleMoves(t.getCurrentCellOccupied()));
			return moves;
		}
		return null;
	}
	
	public static void update(Move m){
		BoardCell from = m.getFromCell();
		BoardCell to = m.getToCell();
		Piece p = m.getMovedPiece();
		
		model.setLocation(from, "-");
		model.setLocation(to, p.getEnumVal().getStr());
	}
	
	//flips the matrix so the next player can play as 1st player and loads it to the view
	public static void rotateToNextTurn(){
		Board b = getBoard();
		Board.flipMat(b.getBoard());
		view.clearUI();
		view.loadDataToBoardUI(model);
		if (!Board.ChessPiece.willLeaveUsInCheck(b.getBoard())) check = false;
		ct++;
		ArrayList<Move> post_move_ops = Board.ChessPiece.possibleMoves(b.getBoard());
		for (Move x : post_move_ops){
			Piece targetPiece = x.getTargetedPiece();
			if (getThisTurnsPlayer()==1 && targetPiece instanceof WhiteKing) check = true;
			else if (getThisTurnsPlayer()==2 && targetPiece instanceof BlackKing) check = true;
		}
		boolean dontKeepPlaying = gameOver();
		if (dontKeepPlaying){
			JOptionPane.showMessageDialog(view, getOppositeTurnsPlayer()+" Won By Checkmate");
			System.exit(0);
		}
	}
	
	public static boolean gameOver(){
		ArrayList<Move> moves = Board.ChessPiece.possibleMoves(model.getBoard());
		moves = Board.ChessPiece.edit(moves);
		int numOfCurrentPlayersMoves = 0;
		for (Move r : moves){
			Piece p = r.getMovedPiece();
			if (getThisTurnsPlayer() == 1){
				if (isWhitePiece(p)) numOfCurrentPlayersMoves++;
			}
			else if (getThisTurnsPlayer() == 2){
				if (isBlackPiece(p)) numOfCurrentPlayersMoves++;
			}
		}
		if (numOfCurrentPlayersMoves == 0 && !check){
			if (getThisTurnsPlayer() == 1){
				JOptionPane.showMessageDialog(view, "Stalemate! White has no possible moves and they're\nnot in check.");
				System.exit(0);
			}
			if (getThisTurnsPlayer() == 2){
				JOptionPane.showMessageDialog(view, "Stalemate! Black has no possible moves and they're\nnot in check.");
				System.exit(0);
			}
		}
		if (numOfCurrentPlayersMoves == 0 && check) {
			return true;
		}
		if (check) JOptionPane.showMessageDialog(view, "Check.");
		return false;
	}
	
	public static void main(String[] args){
		java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
            	JOptionPane.showMessageDialog(view, "Welcome to LSChess! Let's Play!");
                ChessGame cg = new ChessGame();
            	view.createAndShowUI();
                view.loadDataToBoardUI(model);
            }
        });
	}
}

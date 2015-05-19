package chess;
import java.util.ArrayList;

public class Board {
	private static String[][] board;
	
	public Board(){
		board = new String[][] { 
				{"b_c","b_h","b_b","b_k","b_q","b_b","b_h","b_c"},
				{"b_p","b_p","b_p","b_p","b_p","b_p","b_p","b_p"},
				{"-",  "-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"},
				{"-",  "-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"},
				{"-",  "-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"},
				{"-",  "-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"},
				{"w_p","w_p","w_p","w_p","w_p","w_p","w_p","w_p"},
				{"w_c","w_h","w_b","w_k","w_q","w_b","w_h","w_c"} };
	}
	
	public String[][] getBoard() { return board; }
	public void setBoard(String[][] b) { board = b; }
	
	public static void printForP1()
	{
		int c = 8;
		System.out.println("\ta\tb\tc\td\te\tf\tg\th\t");
		System.out.println("---------------------------------------------------------------------------");
		for (String[] row : board)
		{
			System.out.print(c+"|\t");
		    for (String value : row)
		    {
		    	if (value == null) System.out.println("null\t");
		    	if (value.equals("-")) System.out.print("-\t");
		    	else System.out.print(value+"\t");
		    }
		    System.out.print("|"+c+"\n\n");
		    c--;
		}
		System.out.println("---------------------------------------------------------------------------");
		System.out.println("\ta\tb\tc\td\te\tf\tg\th\t\n");
	}
	
	public static void printForP2()
	{
		System.out.println("\th\tg\tf\te\td\tc\tb\ta\t");
		System.out.println("---------------------------------------------------------------------------");
		for (int j=7; j>-1; j--){
			System.out.print((j+1)+"|\t");
			for (int i=7; i>-1; i--){
				if (board[j][i] == null) System.out.println("null\t");
		    	if (board[j][i].equals("-")) System.out.print("-\t");
		    	else System.out.print(board[j][i].toString()+"\t");
			}
			System.out.print("|"+(j+1)+"\n\n");
		}
		System.out.println("---------------------------------------------------------------------------");
		System.out.println("\th\tg\tf\te\td\tc\tb\ta\t\n");
	}
	
	public enum ChessPiece {
		//possible pieces or empty tiles
		WHITE_CASTLE("w_c"), WHITE_KNIGHT("w_h"), WHITE_BISHOP("w_b"), WHITE_QUEEN("w_q"), WHITE_KING("w_k"), WHITE_PAWN("w_p"),
		BLACK_CASTLE("b_c"), BLACK_KNIGHT("b_h"), BLACK_BISHOP("b_b"), BLACK_QUEEN("b_q"), BLACK_KING("b_k"), BLACK_PAWN("b_p"), 
		EMPTY("-");
		
		private String str;
		private String getStr(){ return str; }
		
		private ChessPiece(String s){ this.str=s; }
		
		private static ArrayList<Move> possibleMoves(String[][] b){
			ArrayList<Move> temp = new ArrayList<Move>();
			
			
			
			return temp;
		}
	}
}

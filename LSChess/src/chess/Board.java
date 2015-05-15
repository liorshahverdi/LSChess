package chess;
//import java.util.ArrayList;

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
		System.out.println("-------------------------------------------------------------------------");
		for (String[] row : board)
		{
			System.out.print("|\t");
		    for (String value : row)
		    {
		    	if (value == null) System.out.println("null\t");
		    	if (value.equals("-")) System.out.print("-\t");
		    	else System.out.print(value+"\t");
		    }
		    System.out.print("|\n\n");
		}
		System.out.println("-------------------------------------------------------------------------");
	}
	
	public static void printForP2()
	{
		System.out.println("-------------------------------------------------------------------------");
		for (int j=7; j>-1; j--){
			System.out.print("|\t");
			for (int i=7; i>-1; i--){
				if (board[j][i] == null) System.out.println("null\t");
		    	if (board[j][i].equals("-")) System.out.print("-\t");
		    	else System.out.print(board[j][i].toString()+"\t");
			}
			System.out.print("|\n\n");
		}
		System.out.println("-------------------------------------------------------------------------");
	}
}

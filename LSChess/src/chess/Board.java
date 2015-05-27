package chess;
import java.util.ArrayList;

public class Board {
	private static String[][] board;
	
	public Board(){
		board = new String[][] { 
				{"b_c","b_h","b_b","b_q","b_k","b_b","b_h","b_c"},
				{"b_p","b_p","b_p","b_p","b_p","b_p","b_p","b_p"},
				{"-",  "-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"},
				{"-",  "-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"},
				{"-",  "-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"},
				{"-",  "-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"  ,"-"},
				{"w_p","w_p","w_p","w_p","w_p","w_p","w_p","w_p"},
				{"w_c","w_h","w_b","w_q","w_k","w_b","w_h","w_c"} };
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
		
		private static ChessPiece getEnum(String str){
			for (ChessPiece t: ChessPiece.values()){
				if (str.equals(t.getStr())) return t;
			}
			return null;
		}
		
		private static boolean isWhite(ChessPiece x){
			if (x == ChessPiece.WHITE_PAWN ||
					x == ChessPiece.WHITE_BISHOP ||
					x == ChessPiece.WHITE_CASTLE ||
					x == ChessPiece.WHITE_KNIGHT ||
					x == ChessPiece.WHITE_QUEEN ||
					x == ChessPiece.WHITE_KING) return true;
			else return false;
		}
		
		private static boolean isBlack(ChessPiece x){
			if (x == ChessPiece.BLACK_PAWN ||
					x == ChessPiece.BLACK_BISHOP ||
					x == ChessPiece.BLACK_CASTLE ||
					x == ChessPiece.BLACK_KNIGHT ||
					x == ChessPiece.BLACK_QUEEN ||
					x == ChessPiece.BLACK_KING) return true;
			else return false;
		}
		
		public static ArrayList<Move> possibleMoves(){
			return new ArrayList<Move>();
		}
		
		public static ArrayList<BoardCell> possibleMoves(BoardCell x){
			ArrayList<BoardCell> temp = new ArrayList<BoardCell>();
			int row = x.getRow();
			int col = x.getCol();
			String piece_str = board[row][col];
			ChessPiece piece = getEnum(piece_str);
			if (ChessGame.getThisTurnsPlayer() == 1){
				//white's moves
				if (piece == ChessPiece.WHITE_PAWN)
				{
					if (row-1 >= 0){
						//move up 1
						if (ChessPiece.getEnum(board[row-1][col]) == ChessPiece.EMPTY){
							BoardCell move = new BoardCell(row-1, col);
							temp.add(move);
						}
						if (col-1 >= 0){
							if (ChessPiece.getEnum(board[row-1][col-1]) != ChessPiece.EMPTY && isBlack(ChessPiece.getEnum(board[row-1][col-1]))){
								BoardCell move = new BoardCell(row-1, col-1);
								move.setIsKill(true);//kill black piece in relative top-left cell
								temp.add(move);
							}
						}
						if (col+1 <= 7){
							if (ChessPiece.getEnum(board[row-1][col+1]) != ChessPiece.EMPTY && isBlack(ChessPiece.getEnum(board[row-1][col+1]))){
								BoardCell move = new BoardCell(row-1, col+1);
								move.setIsKill(true);//kill black piece in relative top-right cell
								temp.add(move);
							}
						}
						if (row-2 >= 0){
							//move up 2
							if (row==6 && ChessPiece.getEnum(board[row-2][col]) == ChessPiece.EMPTY &&
									ChessPiece.getEnum(board[row-1][col]) == ChessPiece.EMPTY){
								BoardCell move = new BoardCell(row-2, col);//move up 2 from initial starting cell
								temp.add(move);

							}
						}
					}
				}
				if (piece == ChessPiece.WHITE_BISHOP)
				{
					int dt = 1;
					boolean collision_tl = false;
					while (!collision_tl){
						if (col - dt <= -1 || row - dt <= -1) break;
						if (ChessPiece.getEnum(board[row-dt][col-dt]) != ChessPiece.EMPTY){
							if (isBlack(ChessPiece.getEnum(board[row-dt][col-dt]))){
								BoardCell move = new BoardCell(row-dt, col-dt);
								move.setIsKill(true);
								temp.add(move);
							}
							collision_tl = true;
						}
						else{
							BoardCell move = new BoardCell(row-dt, col-dt);
							temp.add(move);
						}
					}
					dt = 1;
					boolean collision_bl = false;
					while (!collision_bl){
						if (col-dt <= -1 || row+dt>=8) break;
						if ((ChessPiece.getEnum(board[row+dt][col-dt])) != ChessPiece.EMPTY){
							if (isBlack(ChessPiece.getEnum(board[row+dt][col-dt]))){
								BoardCell move = new BoardCell(row+dt, col-dt);
								move.setIsKill(true);
								temp.add(move);
							}
							collision_bl = true;
						}
						else{
							BoardCell move = new BoardCell(row+dt, col-dt);
							temp.add(move);
							dt++;
						}
					}
					dt = 1;
					boolean collision_tr = false;
					while (!collision_tr){
						if (col+dt >=8 || row-dt <= 1) break;
						if (ChessPiece.getEnum(board[row-dt][col+dt]) != ChessPiece.EMPTY){
							//check for kill option
							if (isBlack(ChessPiece.getEnum(board[row-dt][col+dt]))){
								BoardCell move = new BoardCell(row-dt, col+dt);
								move.setIsKill(true);
								temp.add(move);
							}
							collision_tr = true;
						}
						else{
							BoardCell move = new BoardCell(row-dt, col+dt);
							temp.add(move);
							dt++;
						}
					}
					dt = 1;
					boolean collision_br = false;
					while (!collision_br){
						if ((col+dt == 8) ||(row+dt == 8)) break;
						if (ChessPiece.getEnum(board[row+dt][col+dt]) != ChessPiece.EMPTY){
							//check for kill option
							if (isBlack(ChessPiece.getEnum(board[row+dt][col+dt]))){
								BoardCell move = new BoardCell(row+dt, col+dt);
								move.setIsKill(true);
								temp.add(move);
							}
							collision_br = true;
						}
						else{
							BoardCell move = new BoardCell(row+dt, col+dt);
							temp.add(move);
							dt++;
						}
					}
				}
				if (piece == ChessPiece.WHITE_CASTLE)
				{
					int dt = 1;
					if (col >= 0 && col <= 7){
						boolean collision_left = false;
						while (!collision_left){
							if (col-dt == -1) break;
							if (ChessPiece.getEnum(board[row][col-dt]) != ChessPiece.EMPTY){
								if (isBlack(ChessPiece.getEnum(board[row][col-dt]))){
									BoardCell move = new BoardCell(row, col-dt);
								}
								collision_left = true;
							}
						}
					}
					
				}
			}
			else {
				//black's moves
				if (piece == ChessPiece.BLACK_PAWN)
				{
					if (row-1 >= 0){
						//move up 1
						if (ChessPiece.getEnum(board[row-1][col]) == ChessPiece.EMPTY){
							BoardCell move = new BoardCell(row-1, col);
							temp.add(move);
						}
						if (col-1 >= 0){
							if (ChessPiece.getEnum(board[row-1][col-1]) != ChessPiece.EMPTY && isWhite(ChessPiece.getEnum(board[row-1][col-1]))){
								BoardCell move = new BoardCell(row-1, col-1);
								move.setIsKill(true);//kill black piece in relative top-left cell
								temp.add(move);
							}
						}
						if (col+1 <= 7){
							if (ChessPiece.getEnum(board[row-1][col+1]) != ChessPiece.EMPTY && isWhite(ChessPiece.getEnum(board[row-1][col+1]))){
								BoardCell move = new BoardCell(row-1, col+1);
								move.setIsKill(true);//kill black piece in relative top-right cell
								temp.add(move);
							}
						}
						if (row-2 >= 0){
							//move up 2
							if (row==6 && ChessPiece.getEnum(board[row-2][col]) == ChessPiece.EMPTY &&
									ChessPiece.getEnum(board[row-1][col]) == ChessPiece.EMPTY){
								BoardCell move = new BoardCell(row-2, col);//move up 2 from initial starting cell
								temp.add(move);

							}
						}
					}
				}
				if (piece == ChessPiece.BLACK_BISHOP)
				{
					int dt = 1;
					boolean collision_tl = false;
					while (!collision_tl){
						if (col - dt <= -1 || row - dt <= -1) break;
						if (ChessPiece.getEnum(board[row-dt][col-dt]) != ChessPiece.EMPTY){
							if (isWhite(ChessPiece.getEnum(board[row-dt][col-dt]))){
								BoardCell move = new BoardCell(row-dt, col-dt);
								move.setIsKill(true);
								temp.add(move);
							}
							collision_tl = true;
						}
						else{
							BoardCell move = new BoardCell(row-dt, col-dt);
							temp.add(move);
						}
					}
					dt = 1;
					boolean collision_bl = false;
					while (!collision_bl){
						if (col-dt <= -1 || row+dt>=8) break;
						if ((ChessPiece.getEnum(board[row+dt][col-dt])) != ChessPiece.EMPTY){
							if (isWhite(ChessPiece.getEnum(board[row+dt][col-dt]))){
								BoardCell move = new BoardCell(row+dt, col-dt);
								move.setIsKill(true);
								temp.add(move);
							}
							collision_bl = true;
						}
						else{
							BoardCell move = new BoardCell(row+dt, col-dt);
							temp.add(move);
							dt++;
						}
					}
					dt = 1;
					boolean collision_tr = false;
					while (!collision_tr){
						if (col+dt >=8 || row-dt <= 1) break;
						if (ChessPiece.getEnum(board[row-dt][col+dt]) != ChessPiece.EMPTY){
							//check for kill option
							if (isWhite(ChessPiece.getEnum(board[row-dt][col+dt]))){
								BoardCell move = new BoardCell(row-dt, col+dt);
								move.setIsKill(true);
								temp.add(move);
							}
							collision_tr = true;
						}
						else{
							BoardCell move = new BoardCell(row-dt, col+dt);
							temp.add(move);
							dt++;
						}
					}
					dt = 1;
					boolean collision_br = false;
					while (!collision_br){
						if ((col+dt == 8) ||(row+dt == 8)) break;
						if (ChessPiece.getEnum(board[row+dt][col+dt]) != ChessPiece.EMPTY){
							//check for kill option
							if (isWhite(ChessPiece.getEnum(board[row+dt][col+dt]))){
								BoardCell move = new BoardCell(row+dt, col+dt);
								move.setIsKill(true);
								temp.add(move);
							}
							collision_br = true;
						}
						else{
							BoardCell move = new BoardCell(row+dt, col+dt);
							temp.add(move);
							dt++;
						}
					}
				}
			}
			return temp;
		}
	}
}

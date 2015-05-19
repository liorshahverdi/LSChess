package chess;

import java.awt.*;
import java.awt.event.*;
import java.awt.image.BufferedImage;
import javax.swing.*;
import javax.swing.border.*;
import javax.imageio.ImageIO;

public class Game {
    private static final Dimension LAYERED_PANE_SIZE = new Dimension(500,500);
	private GridLayout gridLayout = new GridLayout(8,8,3,3);
	private JPanel backPanel = new JPanel(gridLayout);
    private JPanel[][] panelGrid = new JPanel[8][8];

	
	public Game(){
		backPanel.setSize(LAYERED_PANE_SIZE);
		backPanel.setLocation(6,6);
		backPanel.setBackground(Color.black);
		for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                panelGrid[row][col] = new JPanel(new GridBagLayout());
                backPanel.add(panelGrid[row][col]);
            }
        }
	}
	
	private static void createAndShowUI(){
		JFrame f = new JFrame("LS Chess");
		f.getContentPane().add(new Game());
		f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		f.pack();
		f.setLocationRelativeTo(null);
		f.setVisible(true);
	}
	
	public static void main(String[] args){
		java.awt.EventQueue.invokeLater(new Runnable() {
			public void run(){
				createAndShowUI();
			}
		});
	}
}

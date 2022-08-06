import java.util.ArrayList;

import java.awt.image.BufferedImage;

public abstract class MapAbstract {
	public static final int SEA_LEVEL = 140;
	public static final int GREEN_RANGE = 150;
	public static final int SNOW_LINE = 190;
	
	private double width, height, zoom, currX, currY;
	
	private ArrayList<ArrayList<Noise>> altitudeNoise, temperatureNoise;
	private ArrayList<Region> regions;
	
	private boolean showContours;
	
	public abstract double getAltitude(double x, double y);
	
	public abstract double getWaterLevel(double x, double y);
	
	public abstract double getLight(double x, double y, double time);
	
	public abstract double getAverageLight(double x, double y);
	
	public abstract double getTemperature(double x, double y, double time);
	
	public abstract double getAverageTemperature(double x, double y);
	
	public abstract ArrayList<Region> getRegions(double x, double y);
	
	public abstract double[] getFullCoords(double x, double y);
	
	public abstract double getX(double... coords);
	
	public abstract double getY(double... coords);
	
	public BufferedImage toImage(BufferedImage image) {
		int imgWidth = image.getWidth();
		int imgHeight = image.getHeight();
		
		int[] pixels = new int[imgWidth * imgHeight];
		
		for (int x = 0; x < imgWidth; x++) {
			for (int y = 0; y < imgHeight; y++) {
				int val = (int)(getAltitude(x, y) * 256);
				
				boolean edge = false;
				
				if (showContours) {
					val /= 10;
					
					for (int i = 0; i <= 1 && x + i < imgWidth; i++) {
						for (int j = 0; j <= 1 && y + j < imgHeight; j++) {
							if (val != (int)(getAltitude(x + i, y + j) * 25.6)) {
								edge = true;
								break;
							}
						}
					}
					
					val *= 10;
				}
				
				if (val < SEA_LEVEL) {
					pixels[x + y * imgWidth] = val;
				}
				else if (val < SNOW_LINE) {
					if (edge) pixels[x + y * imgWidth] = 0;
					else pixels[x + y * imgWidth] = (((val - SEA_LEVEL) * GREEN_RANGE) / (SNOW_LINE - SEA_LEVEL) + GREEN_RANGE / 2) << 8;
				}
				else {
					if (edge) pixels[x + y * imgWidth] = 0;
					else pixels[x + y * imgWidth] = val | (val << 8) | (val << 16);
				}
			}
		}
		
		image.setRGB(0, 0, imgWidth, imgHeight, pixels, 0, imgWidth);
		
		return image;
	}
}
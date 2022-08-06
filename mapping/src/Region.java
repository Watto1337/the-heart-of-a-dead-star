import java.util.ArrayList;

public class Region {
	private double[] boundingBox;
	private ArrayList<double[]> vertices;
	
	public Region() {
		boundingBox = new double[4];
		vertices = new ArrayList<double[]>();
	}
	
	public void addVertex(double x, double y) {
		insertVertex(vertices.size() - 1, x, y);
	}
	
	public void insertVertex(int i, double x, double y) {
		vertices.add(i, new double[] {x, y});
		
		if (x < boundingBox[0]) boundingBox[0] = x;
		if (y < boundingBox[1]) boundingBox[1] = y;
		if (x > boundingBox[2]) boundingBox[2] = x;
		if (y > boundingBox[3]) boundingBox[3] = y;
	}
	
	public boolean pointInBoundingBox(double x, double y) {
		return x > boundingBox[0] && y > boundingBox[1] && x < boundingBox[2] && y < boundingBox[3];
	}
	
	public boolean pointInRegion(double x, double y) {
		return pointInBoundingBox(x, y);
	}
}
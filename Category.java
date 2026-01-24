import java.io.*;
import java.util.*;

public class Category {
    String name = "unnamed";
    HashMap<String, Double> State2Val = new HashMap<>();
    HashMap<String, Integer> State2Rank = new HashMap<>();
    public Category(File file){
        String[] states = {
                "alabama", "alaska", "arizona", "arkansas", "california", 
                "colorado", "connecticut", "delaware", "florida", "georgia", 
                "hawaii", "idaho", "illinois", "indiana", "iowa", 
                "kansas", "kentucky", "louisiana", "maine", "maryland", 
                "massachusetts", "michigan", "minnesota", "mississippi", "missouri", 
                "montana", "nebraska", "nevada", "new hampshire", "new jersey", 
                "new mexico", "new york", "north carolina", "north dakota", "ohio", 
                "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina", 
                "south dakota", "tennessee", "texas", "utah", "vermont", 
                "virginia", "washington", "west virginia", "wisconsin", "wyoming"
            };
        try (BufferedReader br = new BufferedReader(new FileReader(file))){
            String line;
            if ((line = br.readLine()) != null){ //this is to name the category
                String[] parts = line.split(",");
                name = parts[1];
            }
            while ((line = br.readLine())!= null){ //this reads the csv file and puts the data in a map
                String[] parts = line.split(",");
                String state = parts[0].toLowerCase();
                Double stat = Double.parseDouble(parts[1]);
                State2Val.put(state, stat);
            }
            if (State2Val.size() != 50){ //just in case i fucked up somewhere
                throw new RuntimeException(file.getName()+" does not contain 50 states");
            }
            Arrays.sort(states, (a,b) -> Double.compare(State2Val.get(b), State2Val.get(a))); //apparently this will sort the states based on their value (descending?)
            int rank = 1;
            for (String state : states){ //assign ranks
                State2Rank.put(state,rank++);
            }
        } catch (Exception e) { //aaaaahhhh
            System.err.println("Error when processing file:" + file.getPath());
            e.printStackTrace();
        }

    }
    public String getName(){ //returns category name
        return name;
    }
    public int getRank(String state){
        String cleanState = state.toLowerCase().trim();
        if (!State2Rank.containsKey(cleanState)) {
        return -1;
        }
        return State2Rank.get(cleanState);
    }
}

import java.io.*;
import java.util.*;
public class Datordle {
    static ArrayList<Category> categories = new ArrayList<>(); //all categories are here
    static int tries = 0;
    static String[] states = {
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
    public static void initialize(String folderPath){
        File folder = new File(folderPath);
        if (folder.listFiles() == null){
            System.out.println("No files found or smth");
            return;
        }
        for (File file : folder.listFiles()){ //process all files in the folder
            if (file.getName().endsWith(".csv")){
                categories.add(new Category(file)); //converts data in file to a category
            }
        }
        System.out.println("data initialized");
        try {
            Category.saveCategories(categories);
            System.out.println("saved json!");
        }
        catch (Exception e) { System.out.println("could not save json :("); }
    }
    public static void start(){
        //this basically shuffles the categories. generates 5 unique numbers 0-(size of categories-1), which each refer to a category
        List<Integer> catIndexes = new ArrayList<>();
        for (int i = 0; i < categories.size(); i++) catIndexes.add(i);
        Collections.shuffle(catIndexes);
        List<Integer> result = catIndexes.subList(0, 5);

        //scanner
        Scanner sc = new Scanner(System.in);

        //actual game starts here
        System.out.println("Guess the state!");
        String target = states[(int) (Math.random()*50)]; //correct state is stored here
        String guess = "baby elephants";
        while (!guess.equals(target)){
            tries++;
            if (tries<=5){ //we give hints for the first 5 attempts
                Category category = categories.get(catIndexes.get(tries-1));
                System.out.println("The state is ranked #"+category.getRank(target)+" in "+category.getName());
                guess = sc.nextLine();
                System.out.println(guess+" is ranked #"+ category.getRank(guess) + " in "+category.getName()+"\n");
            } else { //no more hints
                System.out.println("Keep guessing!");
                guess = sc.nextLine();
                System.out.println();
            }
        }
        System.out.println("You're right! You guessed it in "+tries+" tries!");
    }
    public static void main(String[] args) throws Exception{
        initialize("StateData");
        start();
    }
}

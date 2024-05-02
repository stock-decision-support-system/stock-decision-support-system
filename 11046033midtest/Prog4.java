import java.util.Scanner;

public class Prog4 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        String[] words = input.split("\\s+");
        
        String[] filterWords = {"fucking", "fuck", "shit", "fucker", "hello"};
        
        for (String word : words) {
            for (String filterWord : filterWords) {
                if (word.toLowerCase().equals(filterWord)) {
                    input = input.replaceAll("\\b" + filterWord + "\\b", "-".repeat(filterWord.length()));
                    break;
                }
            }
        }
        
        System.out.println(input);
    }
}

import java.util.Arrays;

public class Prog6 {
    private String name;
    private int score;

    public Prog6() {
        this.score = 50;
    }

    public Prog6(String name) {
        this.name = name;
        this.score = 50;
    }

    public Prog6(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getScore() {
        return score;
    }

    public static void main(String[] args) {
        Prog6 user1 = new Prog6();
        user1.setName("John");
        Prog6 user2 = new Prog6("May");
        user2.setScore(82);
        Prog6 user3 = new Prog6("J.J.", 70);
        Prog6[] users = {user1, user2, user3};
        double avgScore = Arrays.stream(users).mapToInt(Prog6::getScore).average().orElse(50);
        System.out.printf("%.2f", avgScore);
    }
}

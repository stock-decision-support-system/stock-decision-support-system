import java.util.Scanner;

class ABC {
    private int num;

    public ABC(int num) {
        this.num = num;
    }

    public ABC() {
        // do nothing
    }

    public void print() {
        if (num >= 1) {
            for (int i = 1; i <= num; i++) {
                System.out.println(i);
            }
        }
    }

    public void print(int num) {
        if (num >= 1) {
            for (int i = 1; i <= num; i++) {
                System.out.println(i);
            }
        }
    }
}

public class Prog3 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        new ABC(scanner.nextInt()).print();

        new ABC().print(scanner.nextInt());

        scanner.close();
    }
}

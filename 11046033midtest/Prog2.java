public class Prog2 {

    public static void main(String[] args) {
        print(10, 20, 30, 40, 50);
        print(10);
        print(10, 11, 20, 40);
    }

    public static void print(int... numbers) {
        System.out.print("[");
        for (int i = 0; i < numbers.length; i++) {
            System.out.print(numbers[i]);
            if (i != numbers.length - 1) {
                System.out.print(",");
            }
        }
        System.out.println("]");
    }
}

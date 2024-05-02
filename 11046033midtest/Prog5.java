import java.util.Arrays;
import java.util.Scanner;

public class Prog5 {

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int[] ints = Arrays.stream(in.nextLine().split("\\s+")).mapToInt(Integer::parseInt).toArray();
        System.out.println(Util.isSorted(ints));
    }
}

class Util {
    public static boolean isSorted(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] < arr[i - 1]) {
                return false;
            }
        }
        return true;
    }
}

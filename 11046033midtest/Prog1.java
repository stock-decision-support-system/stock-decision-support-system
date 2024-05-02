abstract class Fruit {
    abstract protected void setUnitPrice(double unitPrice);
    abstract protected double getPrice();
}

class Apple extends Fruit {
    private double unitPrice;
    private double weight;


    protected void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }

    protected void setWeight(double weight) {
        this.weight = weight;
    }


    protected double getPrice() {
        return unitPrice * weight;
    }
}

class Orange extends Fruit {
    private double unitPrice;
    private int amount;


    protected void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }

    protected void setAmount(int amount) {
        this.amount = amount;
    }


    protected double getPrice() {
        return unitPrice * amount;
    }
}

class Watermelon extends Fruit {
    private double unitPrice;
    private double weight;


    protected void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }

    protected void setWeight(double weight) {
        this.weight = weight;
    }


    protected double getPrice() {
        return unitPrice * weight;
    }
}

public class Prog1 {
    public static void main(String[] args) throws Exception {
        Apple apple = new Apple();
        apple.setUnitPrice(60);
        apple.setWeight(10.5);
        Orange orange = new Orange();
        orange.setUnitPrice(20.1);
        orange.setAmount(10);
        Orange orange2 = new Orange();
        orange2.setUnitPrice(10);
        orange2.setAmount(10);
        Watermelon watermelon = new Watermelon();
        watermelon.setUnitPrice(2.5);
        watermelon.setWeight(100);
        double totalPrice = 0.0;
        Fruit[] fruits = {apple, orange, orange2, watermelon};
        for (Fruit fruit : fruits) {
            totalPrice += fruit.getPrice();
        }
        System.out.println((int)totalPrice);
    }
}

import 'dart:io';

void main() {
  print("Enter a number: ");
  String? input = stdin.readLineSync();
  int number = int.tryParse(input ?? '') ?? 0;
  for (int i = 1; i <= number; i++) {
    print(i);
  }
}

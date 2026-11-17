static unsigned char input[128];

unsigned char *inputPointer(void) {
  return input;
}

int validatePassword(int length) {
  const unsigned char encoded[] = {
    55, 63, 55, 53, 40, 35, 119, 51, 41, 119,
    52, 53, 46, 119, 41, 63, 57, 40, 63, 46
  };
  unsigned char expected[sizeof encoded];

  for (unsigned int index = 0; index < sizeof encoded; index++) {
    expected[index] = encoded[index] ^ 0x5a;
  }

  if (length != sizeof expected) return 0;
  for (int index = 0; index < length; index++) {
    if (input[index] != expected[index]) return 0;
  }
  return 1;
}
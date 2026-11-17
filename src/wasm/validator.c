static unsigned char input[128];
static unsigned char image[256 * 256 * 4];

unsigned char *inputPointer(void) {
  return input;
}

unsigned char *imagePointer(void) {
  return image;
}

int validatePassword(int length) {
  unsigned int state = 0x811c9dc5u;
  unsigned int step = 7;
  unsigned char expected[128];
  int expectedLength = (int)image[0] - 8;

  if (expectedLength < 1 || expectedLength > sizeof expected) return 0;
  for (;;) {
    unsigned int left = step;
    unsigned int right = (unsigned int)expectedLength;
    while (right != 0) {
      unsigned int remainder = left % right;
      left = right;
      right = remainder;
    }
    if (left == 1) break;
    step++;
  }

  for (unsigned int index = 0; index < 8; index++) {
    state = (state ^ image[(index + 1) * 4]) * 16777619u;
  }
  for (unsigned int index = 0; index < (unsigned int)expectedLength; index++) {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    expected[(index * step + 11) % (unsigned int)expectedLength] =
      (unsigned char)((image[(index + 9) * 4] ^ (state & 255u)) - index * 29u);
  }

  if (length != expectedLength) return 0;
  for (int index = 0; index < length; index++) {
    if (input[index] != expected[index]) return 0;
  }
  return 1;
}
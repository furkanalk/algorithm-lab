export default function delay(ms = 500) {
    return new Promise(res => setTimeout(res, ms));
  }
  
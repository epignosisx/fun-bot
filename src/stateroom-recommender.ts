export function recommend(estimate: Number){
  if (estimate <= 100000) {
    return "IS";
  } else if (estimate <= 200000){
    return "OS";
  } else if (estimate <= 300000) {
    return "OB";
  } else {
    return "SU";
  }
}
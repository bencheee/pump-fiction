import "server-only";

/*
 * The wall clock at the moment a route rendered, for the screens whose first
 * client render has to agree with the HTML it hydrates.
 *
 * A clock read on the client during render is read twice — once in the server
 * render, once at hydration — and the two are apart by however long the HTML
 * took to arrive. React reports that as a text mismatch and pays for it by
 * regenerating the tree, so the screens that show elapsed time take this
 * reading as a prop and only move to the device's clock on their first tick.
 *
 * Routes that use it are `force-dynamic`, so the reading is per request. It is
 * a function rather than a `Date.now()` in the component because reading the
 * clock while rendering is the impurity the rule against it means.
 */
export async function renderedAt(): Promise<number> {
  return Date.now();
}

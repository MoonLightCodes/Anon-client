import { useRef } from "react";
import { useGlobalContext } from "../context/ContextProvider";

export const useThrottling = () => {
  console.log("in throtting")
  const isCalled = useRef(false);
  const { dispatch } = useGlobalContext();

  const throttlingFetch = async (
    fn,
    setDataAt,
    setLoading,
    setErrorAt,
    delay = 3000
  ) => {
    if (isCalled.current) return;
    isCalled.current = true;

    dispatch({ type: setLoading, value: true });

    try {
      const data = await fn();
      if (setDataAt !== "")
        dispatch({ type: setDataAt, value: data.data.data.phrase });
      
    } catch (error) {
      console.log(error);
      dispatch({
        type: setErrorAt,
        value:error?.response?.data?.message ||error?.response?.message ||"Something went wrong",
      });
    } finally {
      dispatch({ type: setLoading, value: false });
      setTimeout(() => {
        isCalled.current = false;
      }, delay);
    }
  };

  return throttlingFetch;
};

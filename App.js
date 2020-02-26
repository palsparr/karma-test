
import { createStackNavigator, createAppContainer } from "react-navigation";
import LocationList from "./screens/LocationListScreen";

const AppNavigator = createStackNavigator(
  {
    LocationList: LocationList
  },
  {
    defaultNavigationOptions: {
      header: null
    },
  },
  {
    initialRouteName: "LocationList"
  }
);

export default createAppContainer(AppNavigator);

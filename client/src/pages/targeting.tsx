import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, Users, Clock, Plus, X } from "lucide-react";

export default function Targeting() {
  const [locations, setLocations] = useState([
    { id: 1, name: "Downtown Seattle", radius: 5, active: true },
    { id: 2, name: "Capitol Hill", radius: 3, active: true },
    { id: 3, name: "Fremont", radius: 2, active: false },
  ]);
  const [renderKey, setRenderKey] = useState(0);

  const [demographics, setDemographics] = useState({
    ageMin: 25,
    ageMax: 55,
    interests: ["coffee", "local business", "organic food"],
    behaviors: ["frequent local shoppers", "mobile users"],
  });

  const [schedules, setSchedules] = useState([
    { day: "Monday", start: "06:00", end: "20:00", active: true },
    { day: "Tuesday", start: "06:00", end: "20:00", active: true },
    { day: "Wednesday", start: "06:00", end: "20:00", active: true },
    { day: "Thursday", start: "06:00", end: "20:00", active: true },
    { day: "Friday", start: "06:00", end: "22:00", active: true },
    { day: "Saturday", start: "07:00", end: "22:00", active: true },
    { day: "Sunday", start: "07:00", end: "20:00", active: true },
  ]);

  const addLocation = () => {
    console.log('Add Location clicked, current locations:', locations.length);
    const newLocation = {
      id: Date.now(), // Use timestamp for unique ID
      name: "New Location",
      radius: 5,
      active: true,
    };
    setLocations(prevLocations => {
      const updatedLocations = [...prevLocations, newLocation];
      console.log('Location added:', newLocation);
      console.log('Updated locations array:', updatedLocations);
      return updatedLocations;
    });
    setRenderKey(prev => prev + 1); // Force re-render
  };

  const removeLocation = (id: number) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const toggleLocation = (id: number) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, active: !loc.active } : loc
    ));
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Targeting & Audience</h2>
          <p className="text-sm text-gray-500">Configure hyperlocal targeting and audience parameters</p>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        <Tabs defaultValue="geographic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geographic" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Geographic
            </TabsTrigger>
            <TabsTrigger value="demographic" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Demographics
            </TabsTrigger>
            <TabsTrigger value="behavioral" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Behavioral
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geographic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Hyperlocal Targeting
                  <Button onClick={addLocation} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent key={renderKey} className="space-y-4">
                <div className="text-xs text-gray-400 mb-2">
                  Total locations: {locations.length} (Render: {renderKey})
                </div>
                {locations.map((location) => (
                  <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={location.active}
                        onCheckedChange={() => toggleLocation(location.id)}
                      />
                      <div className="flex-1">
                        <Input
                          value={location.name}
                          onChange={(e) => {
                            setLocations(locations.map(loc =>
                              loc.id === location.id ? { ...loc, name: e.target.value } : loc
                            ));
                          }}
                          className="font-medium"
                        />
                        <div className="mt-2">
                          <Label className="text-sm text-gray-500">
                            Radius: {location.radius} miles
                          </Label>
                          <Slider
                            value={[location.radius]}
                            onValueChange={(value) => {
                              setLocations(locations.map(loc =>
                                loc.id === location.id ? { ...loc, radius: value[0] } : loc
                              ));
                            }}
                            max={25}
                            min={1}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeLocation(location.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">8.5M</div>
                    <div className="text-sm text-gray-500">Total Reach</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">42%</div>
                    <div className="text-sm text-gray-500">Local Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">$2.40</div>
                    <div className="text-sm text-gray-500">Est. Cost per Click</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Age & Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Age Range: {demographics.ageMin} - {demographics.ageMax} years</Label>
                  <div className="px-4">
                    <Slider
                      value={[demographics.ageMin, demographics.ageMax]}
                      onValueChange={(value) => {
                        setDemographics({
                          ...demographics,
                          ageMin: value[0],
                          ageMax: value[1],
                        });
                      }}
                      max={65}
                      min={18}
                      step={1}
                      className="mb-4"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Gender</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Income Level</Label>
                  <Select defaultValue="middle">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Income Levels</SelectItem>
                      <SelectItem value="lower">Lower Income</SelectItem>
                      <SelectItem value="middle">Middle Income</SelectItem>
                      <SelectItem value="upper">Upper Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Education</Label>
                  <Select defaultValue="college">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Education Levels</SelectItem>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="graduate">Graduate Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavioral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interests & Behaviors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Current Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {demographics.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {interest}
                        <X 
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => {
                            setDemographics({
                              ...demographics,
                              interests: demographics.interests.filter((_, i) => i !== index)
                            });
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add new interest..." />
                    <Button size="sm">Add</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Purchasing Behaviors</Label>
                  <div className="space-y-2">
                    {[
                      "Frequent local shoppers",
                      "Online purchasers",
                      "Price-conscious buyers",
                      "Premium brand preference",
                      "Mobile commerce users",
                      "Social media influenced"
                    ].map((behavior) => (
                      <div key={behavior} className="flex items-center space-x-2">
                        <Switch 
                          checked={demographics.behaviors.includes(behavior)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setDemographics({
                                ...demographics,
                                behaviors: [...demographics.behaviors, behavior]
                              });
                            } else {
                              setDemographics({
                                ...demographics,
                                behaviors: demographics.behaviors.filter(b => b !== behavior)
                              });
                            }
                          }}
                        />
                        <Label>{behavior}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Device Targeting</Label>
                  <div className="space-y-2">
                    {["Mobile", "Desktop", "Tablet"].map((device) => (
                      <div key={device} className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <Label>{device}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ad Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.day} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={schedule.active}
                        onCheckedChange={(checked) => {
                          setSchedules(schedules.map(s =>
                            s.day === schedule.day ? { ...s, active: checked } : s
                          ));
                        }}
                      />
                      <div className="w-20 font-medium">{schedule.day}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="time"
                        value={schedule.start}
                        onChange={(e) => {
                          setSchedules(schedules.map(s =>
                            s.day === schedule.day ? { ...s, start: e.target.value } : s
                          ));
                        }}
                        className="w-32"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={schedule.end}
                        onChange={(e) => {
                          setSchedules(schedules.map(s =>
                            s.day === schedule.day ? { ...s, end: e.target.value } : s
                          ));
                        }}
                        className="w-32"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timezone Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Campaign Timezone</Label>
                  <Select defaultValue="america/los_angeles">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america/los_angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="america/denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="america/chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="america/new_york">Eastern Time (ET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end space-x-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Targeting Settings</Button>
        </div>
      </div>
    </>
  );
}

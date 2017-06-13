<?php

/**
	unit tests for MyController.
	this class illustrates how unit testing may be done 
	in an mvc framework using dependency injection and factory design patterns
*/
class MyControllerTest extends PHPUnit_Framework_TestCase
{
	private $myController;

	/**
		perform any operations needed to prepare for a test
	*/
	protected function setUp()
	{
		$this->myController = new MyController();		
	}

	/**
		provides an array of data for each test to run with testMain
	*/
	public function testMainProvider()
	{
		// userId, userName, userAge
		return array(
			array(null, null, null), // test with nobody logged in
			array(1111, 'Mr. Smith', 31), // test with a user logged in
			array(1112, 'Ms. Jones', 27), // test with a different user logged in
		);
	}
 
	/**
		test the main() method of the controller
		@dataProvider testMainProvider
	*/
	public function testMain($userId, $userName, $userAge)
	{
		//// mock MySession
		$mySessionMock = $this->getMockBuilder('MySession')
			->disableOriginalConstructor()
			->getMock();
		
		// the MySession object will provide the userId for a logged in user,
		// or null if nobody is logged in
		$mySessionMock->expects($this->once())
			->method('getUserId')
			->will($this->returnValue($userId));
		
		//// mock UserDAO
		// the data object to pass to the controller
		$userData = (object) array(
			'userName' => $userName,
			'userAge' => $userAge
		);
		
		$userDAOMock = $this->getMockBuilder('UserDAO')
			->disableOriginalConstructor()
			->getMock();
		
		if($userId === null)
		{
			$userDAOMock->expects($this->exactly(0))
				->method('getUser');
		}
		else
		{
			$userDAOMock->expects($this->once())
				->method('getUser')
				->will($this->returnValue($userData));
		}
		
		//// mock ViewFactory
		$viewFactoryMock = $this->getMockBuilder('ViewFactory')
			->disableOriginalConstructor()
			->getMock();
		
		// the ViewFactory expects a different view to be requested 
		// by the controller depending on the value of userId
		if($userId === null)
		{	// userId is null, so we expect a WelcomeView to be requested by the controller
			$expectedViewClassName = 'WelcomeView';
			$expectedViewMock = $this->getMockBuilder('WelcomeView')
				->disableOriginalConstructor()
				->getMock();
			
			$expectedViewMock->expects($this->once())
				->method('init');
		}
		else
		{	// userId is not null, so we expect a DashboardView to be requested by the conroller
			$expectedViewClassName = 'DashboardView';
			$expectedViewMock = $this->getMockBuilder('DashboardView')
				->disableOriginalConstructor()
				->getMock();
			
			// check the view was passed the correct user information
			$expectedViewMock->expects($this->once())
				->method('init')
				->with($this->callback(
					function($subject) use ($userName, $userAge) {
						return $subject['userName'] === $userName 
							&& $subject['userAge'] === $userAge;
					}
				));
		}
		
		$viewFactoryMock->expects($this->once())
			->method('getView')
			->with($this->equalTo($expectedViewClassName))
			->will($this->returnValue($expectedViewMock));
		
		//// Dependency Inject
		$this->myController->setMySession($mySessionMock);
		$this->myController->setUserDAO($userDAOMock);
		$this->myController->setViewFactory($viewFactoryMock);
		
		//// Run Functionality
		$this->myController->main();

		//// Assertions
		// check the controller responds with the correct view
		$this->assertEquals($expectedViewMock, $this->myController->getView());
    }
 
}